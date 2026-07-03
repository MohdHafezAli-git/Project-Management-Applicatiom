import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { task } from "../models/task.models.js";
import { subTask } from "../models/subtask.models.js";

export const verifyJWT = asyncHandler(async(req , res , next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if (!token){
        throw new ApiError(401 , "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

        if (!user){
            throw new ApiError(401 , "Invalid access token")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401 , "Invalid access token")
    }
     
})

export const vallidateProjectPermission = (roles = [])=>{
    return asyncHandler(async(req , res , next) =>{
        const {projectId} = req.params

        if (!projectId){
            throw new ApiError(400 , "Project Id not found")
        }

        const project = await ProjectMember.findOne(
            {
                project : new mongoose.Types.ObjectId(projectId),
                user : new mongoose.Types.ObjectId(req.user._id)
            }
        )

        if (!project){
            throw new ApiError(400 , "Project not found")
        }

        const givenRole = project?.role 

        req.user.role = givenRole

        if (!roles.includes(givenRole)){
            throw new ApiError(403 , "You do not have permission to perfotm this action")
        }

        next()
    })
}

export const vallidateTaskPermission = (roles = [])=>{
    return asyncHandler(async(req , res , next)=>{

        const {taskId} = req.params

        const Task = await task.findById(taskId)

        if (!Task){
            throw new ApiError(404 , "Task not found")
        }

        const project = await ProjectMember.findOne(
            {
                project : new mongoose.Types.ObjectId(Task.project),
                user : new mongoose.Types.ObjectId(req.user._id)
            } 
        )

        if (!project){
            throw new ApiError(404 , "Project not found")
        }

        const givenRole = project?.role
        req.user.role = givenRole

        if(!roles.includes(givenRole)){
            throw new ApiError(403 , "You do not have permission to perfotm this action")
        }

        next()
    })
}

export const validateSubTaskPermission = (roles = [])=>{
    return asyncHandler(async(req , res , next)=>{

        const {subTaskId} = req.params

        const subtasks = await subTask.findById(subTaskId)

        if (!subtasks){
            throw new ApiError(404 , "Sub Tasks not found")
        }

        const Tasks = await task.findById(subtasks.task)

        if (!Tasks){
            throw new ApiError(404 , "Task not found")
        }

        const project = await ProjectMember.findOne(
            {
                project : new mongoose.Types.ObjectId(Tasks.project),
                user : new mongoose.Types.ObjectId(req.user._id)
            }
        )

        const givenRole = project?.role
        req.user.role = givenRole
        
        if (!roles.includes(givenRole)){
            throw new ApiError(403 , "You do not have permission to perform this action")
        }

        next()
    })
}