import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Tenant from "../models/tenant.js";

export default function (roles) {
    return async function (request, response, next) {

        const receiveToken = request.cookies["user-auth-token"];

        if (!receiveToken) {
            return response
                .status(412)
                .send("Token not found, please attach token and try again");
        }
        try {
            request.user = jwt.verify(receiveToken, process.env.JWT_SECRET_KEY);
            const userRole = request.user.role;
            const id = request.user._id

            if (!userRole) {
                return response.status(403).send("You are not authorised to perform this action");
            } else if (roles.includes(userRole)) {
                if (userRole === "admin" || userRole === "owner") {
                    const user = await User.findById(id);
                    if (user) {
                        request.user = user;
                        request.user.role = user.isAdmin ? "admin" : "owner";
                        next();
                    } else {
                        return response.status(412).send("You are not authorised to perform this action");
                    }
                } else if (userRole === "tenant") {
                    const tenant = await Tenant.findById(id);
                    if (tenant) {
                        request.user = tenant;
                        request.user.role = "tenant";
                        next();
                    } else {
                        return response.status(412).send("You are not authorised to perform this action");
                    }
                }

            } else {
                return response.status(412).send("You are not authorised to perform this action");
            }
        } catch (error) {
            console.log(error)
            response.status(412).send("Couldn't validate token, try signing in again");
        }
    }
}
