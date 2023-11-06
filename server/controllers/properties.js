import mongoose from "mongoose";
import Property from "../models/properties.js";
import Images from "../models/images.js";
import User from "../models/user.js";

export async function createProperty(req, res) {
    const files = req.files;

    if(req.user.role === 'admin') {
        let ownerId = req.query.ownerId
        req.user = await User.findOne({ _id: ownerId })
    }

    if (!req.user.verified) {
        return res.status(400).json({
            success: false,
            message: 'User not verified'
        });
    }

    if (!files) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    const images = [];

    for (const file of files) {

        if (images.length >= 10) {
            break;
        }

        const image = new Images({
            _id: new mongoose.Types.ObjectId(),
            ownerId: req.user._id,
            image: {
                data: file.buffer,
                contentType: 'image/jpeg'
            }
        });

        let savedImage = await image.save()
        if (savedImage) {
            images.push(savedImage._id);
        }
    }

    const property = new Property({
        _id: new mongoose.Types.ObjectId(),
        address: req.body.addr,
        propertyType: req.body.ptype,
        bhk: req.body.bhk,
        location: req.body.location,
        rent: req.body.rent,
        securityDeposit: req.body.secdep,
        age: req.body.age,
        ownerId: req.user._id,
        images: images
    })

    return property
        .save()
        .then((newProperty) => {
            return res.status(201).json({
                success: true,
                message: 'New property successfully added',
                Property: newProperty
            });
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: 'Error in adding a new property' + error
            })
        });
}


export function getAllPropertiesByUser(req, res) {

    if(!req.user.verified) {
        return res.status(400).json({
            success: false,
            message: 'User not verified'
        });
    }

    Property.find({ownerId: req.user._id})
        .then((allProperty) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all Properties',
                Properties: allProperty,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });
}

export function setVerificationStatus(req, res) {
    let verified = req.body.verified;
    let propertyId = req.body.pid;
    let x_coord = req.body.x_coord;
    let y_coord = req.body.y_coord;
    if (verified === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Please attach verified value',
        });
    }

    Property.findOneAndUpdate({_id: propertyId}, {$set: {verified: verified, lat: x_coord, long: y_coord}})
        .then((updatedProperty) => {
            return res.status(200).json({
                success: true,
                message: 'Object Updated'
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });


}

export function getPropertiesOfOwner(req, res) {
    let ownerId = req.query.owner_id;

    Property.find({ownerId: ownerId})
        .then((allProperty) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all Properties',
                Properties: allProperty,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });

}

export function getPropertyById(req, res) {

    Property.findOne({_id: req.body.pid})
        .populate('ownerId')
        .lean()
        .then((oneProperty) => {

            if (oneProperty.ownerId.verified === false && req.user.role === 'tenant') {
                return res.status(400).json({
                    success: false,
                    message: 'Owner not verified',
                });
            }

            if (oneProperty.verified === false && req.user.role === 'tenant') {
                return res.status(400).json({
                    success: false,
                    message: 'Property not verified',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Result',
                Property: oneProperty,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });

}

export function getPropertiesByFilters(req, res) {
    const {bhk, minRent, maxRent, area} = req.body;

    Property.find()
        .populate('ownerId')
        .lean()
        .then((properties) => {

            if(req.user.role !== 'admin') {
                properties = properties.filter((property) => {
                    console.log(property.ownerId)
                    return property.ownerId.verified === true && property.vacancyStatus === true && property.verified === true;
                });
            }

            properties = properties.filter((property) => {
                let condition = true;
                if (bhk !== undefined && bhk !== '') {
                    condition = condition && property.bhk === bhk;
                }
                if (minRent !== undefined) {
                    condition = condition && property.rent >= parseInt(minRent);
                }
                if (maxRent !== undefined) {
                    condition = condition && property.rent <= parseInt(maxRent);
                }
                if (area !== undefined) {
                    //check if contains
                    condition = condition && property.address.toLowerCase().includes(area.toLowerCase());
                }
                return condition;
            });

            return res.status(200).json({
                success: true,
                message: 'Result',
                Property: properties,
            });
        }).catch((err) => {
        res.status(400).json({
            success: false,
            message: 'Filters failed',
            error: err.message,
        });
    });
}

export async function updateProperty(req, res) {
    const updateObject = req.body

    let updateProp = {_id: req.body.pid}

    if (req.user.role !== "admin") {
        if (!req.user.verified) {
            return res.status(400).json({
                success: false,
                message: 'User not verified'
            });
        }

        updateProp.ownerId = req.user._id;
        delete updateObject.verified
        delete updateObject.lat
        delete updateObject.long
    }

    Property.findOneAndUpdate(updateProp, {$set: updateObject})
        .then((updatedProperty) => {
            return res.status(200).json({
                success: true,
                message: 'Object Updated'
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });
}

export async function deleteProperty(req, res) {
    if (req.user.role !== "admin") {
        if (!req.user.verified) {
            return res.status(400).json({
                success: false,
                message: 'User not verified'
            });
        }
    }

    Property.findOneAndDelete({_id: req.body.pid, ownerId: req.user._id})
        .then((oneProperty) => {
            return res.status(200).json({
                success: true,
                message: 'Deleted Property',
                Property: oneProperty,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });
}


export async function uploadFiles(req, res) {

    const files = req.files;
    const propertyId = req.body.propertyId;

    if (req.user.role !== "admin") {
        if (!req.user.verified) {
            return res.status(400).json({
                success: false,
                message: 'User not verified'
            });
        }
    }

    if (!propertyId) {
        return res.status(400).json({
            success: false,
            message: 'Please attach property id'
        });
    }

    if (!files) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    Property.findOne({_id: propertyId, ownerId: req.user._id})
        .then(async (property) => {
            if (!property) {
                return res.status(400).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (property.images.length >= 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 5 images allowed'
                });
            }

            for (const file of files) {

                if (property.images.length >= 10) {
                    break;
                }

                const image = new Images({
                    _id: new mongoose.Types.ObjectId(),
                    ownerId: req.user._id,
                    image: {
                        data: file.buffer,
                        contentType: 'image/jpeg'
                    }
                });

                let savedImage = await image.save()
                if (savedImage) {
                    property.images.push(savedImage._id);
                }
            }

            property.save()
                .then(async (updatedProperty) => {
                    return res.status(200).json({
                        success: true,
                        message: 'Images uploaded successfully',
                        User: updatedProperty
                    });
                })
                .catch(async (err) => {
                    return res.status(500).json({
                        success: false,
                        message: 'Error in uploading images' + err
                    });
                });
        })

}

export function deleteFile(req, res) {

    let propertyId = req.body.propertyId;
    let imageId = req.body.imageId;

    if (req.user.role !== "admin") {
        if (!req.user.verified) {
            return res.status(400).json({
                success: false,
                message: 'User not verified'
            });
        }
    }

    if (!propertyId) {
        return res.status(400).json({
            success: false,
            message: 'Please attach property id'
        });
    }

    if (!imageId) {
        return res.status(400).json({
            success: false,
            message: 'Please attach image id'
        });
    }

    Property.findOne({_id: propertyId, ownerId: req.user._id})
        .then((property) => {
            if (property) {
                if (property.images.indexOf(imageId) === -1) {
                    return res.status(400).json({
                        success: false,
                        message: 'Image not found in property'
                    });
                }

                Images.findOneAndDelete({_id: imageId, ownerId: req.user._id})
                    .then((image) => {
                        if (!image) {
                            return res.status(400).json({
                                success: false,
                                message: 'Image not found'
                            });
                        }

                        let images = property.images;
                        let index = images.indexOf(imageId);
                        if (index > -1) {
                            images.splice(index, 1);
                        }
                        property.images = images;

                        property.save()
                            .then((updatedProperty) => {
                                return res.status(200).json({
                                    success: true,
                                    message: 'Image deleted successfully',
                                    Property: updatedProperty
                                });
                            })
                            .catch((err) => {
                                return res.status(500).json({
                                    success: false,
                                    message: 'Error in deleting images' + err
                                });
                            });

                    })
                    .catch((err) => {
                        return res.status(500).json({
                            success: false,
                            message: 'Error in deleting images' + err
                        });
                    });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Property not found'
                });
            }
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: 'Error in deleting images' + err
            });
        });

}

export function getFile(req, res) {

    let imageId = req.params.id;

    if (!imageId) {
        return res.status(400).json({
            success: false,
            message: 'Please attach image id'
        });
    }

    Images.findOne({_id: imageId})
        .then((image) => {
            if (!image) {
                return res.status(400).json({
                    success: false,
                    message: 'Image not found'
                });
            }

            res.set('Content-Type', image.image.contentType);
            return res.send(image.image.data);
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                message: 'Error in getting image' + err
            });
        });
}