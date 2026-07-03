import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { task } from "../models/task.models.js";
import { subTask } from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from  "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js";


const getTask = asyncHandler(async(req , res)=>{
    const {projectId} = req.params

    const project = await Project.findById(projectId)

    if (!project){
        throw new ApiError(404 , "Project not found")
    }

    const Tasks = await task.find({
        project : new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo" , "avatar username fullName")

    return res
      .status(200)
      .json(
        new ApiResponse(
            201,
            Tasks[0],
            "Task fetched successfully"
        )
      )
})

const createTask = asyncHandler(async(req , res)=>{
    const {projectId} = req.params
    const {title , description , assignedTo} = req.body

    const project = await Project.findById(projectId)

    if (!project){
        throw new ApiError(404 , "Project not found")
    }

    const createdTask = await task.create(
        {
            title,
            description,
            project : new mongoose.Types.ObjectId(projectId),
            assignedTo,
            assignedBy : req.user._id
        }
    )

    return res
      .status(201)
      .json(
        new ApiResponse(
            200,
            createdTask,
            "Task created successfully"
        )
      )
})

const getTaskbyId = asyncHandler(async(req , res)=>{
    const {taskId} = req.params

    const Task = await task.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(taskId)
            },
        },

        {
            $lookup : {
                from : "users",
                localField : "assignedTo",
                foreignField : "_id",
                as : "assignedTo",
                pipeline : [
                    {
                        $project :{
                        _id : 1,
                        username : 1,
                        fullname : 1,
                        avatar : 1
                        }
                    }
                ]
            },
        },
        {
            $lookup : {
                from : "subtasks",
                localField : "_id",
                foreignField : "tasks",
                as : "subtasks",
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "createdBy",
                            foreignField : "_id",
                            as : "createdBy",
                            pipeline : [
                                {
                                    $project : {
                                        _id : 1,
                                        username : 1,
                                        fullname : 1,
                                        avatar : 1
                                    }
                                },
                                {
                                    $addFields : {
                                        createdBy : {
                                            $arrayElemAt : ["$createdBy" , 0]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $addFields : {
                assignedTo : {
                    $arrayElemAt : ["$assignedTo" , 0]
                }
            }
        }
    ])

    if (!Task || Task.length === 0 ){
        throw new ApiError(404 , "Task not found")
    }

    return res 
      .status(200)
      .json(
        new ApiResponse(
            200 ,
            Task,
            "Tasks fetched successfully"
        )
      )
})

const updateTask = asyncHandler(async(req , res)=>{
    console.log("hitted controller");
    
    const {title , description} = req.body
    const {taskId} = req.params

    if (!taskId){
        throw new ApiError(404 , "Project not found")
    }
    const Tasks = await task.findByIdAndUpdate(
        taskId,
        {
            title,
            description
        },
        {
            new : true
        }
    )

    return res 
      .status(200)
      .json(
        new ApiResponse(
            200,
            Tasks,
            "Task updated successfully"
        )
      )

})

const deleteTask = asyncHandler(async(req , res)=>{
    const {taskId} = req.params

     const Task = await task.findByIdAndDelete(taskId)

    if (!Task){
        throw new ApiError(404 , "Task not found" )
    }

    await subTask.deleteMany({
        task : taskId
    })
    
    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {},
            "Task deleted successfully"
        )
      )
})
const createSubTask = asyncHandler(async(req , res)=>{
    const {taskId} = req.params
    const {title , description} = req.body

    const findTask = await task.findById(taskId)

    if(!findTask){
        throw new ApiError(404 , "Task not found")
    }

    const newSubTask = await subTask.create(
        {
            title ,
            description,
            task : taskId,
            createdBy : req.user._id
        }
    )

    return res 
      .status(201)
      .json(
        new ApiResponse(
            201,
            newSubTask,
            "Sub task has been created"
        )
      )


})
const updateSubTask = asyncHandler(async(req , res)=>{
    const {title , isCompleted} = req.body
    const {taskId , subTaskId} = req.params

    const currentTask = await task.findById(taskId)
    
    if (!currentTask){
        throw new ApiError(404 , "Task not found")
    }

    const subTasks = await subTask.findOneAndUpdate(
        {
            _id : subTaskId,
            task : taskId 
        },
        {
            title,
            isCompleted
        },
        {
            new : true
        }
    )

    if (!subTasks){
        throw new ApiError(404 , "Subtasks not found")
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            subTasks,
            "Task has been successfully updated"
        )
      )

})

const deleteSubTask = asyncHandler(async(req , res)=>{
    const {subTaskId} = req.params

    const deletedSubTasks = await subTask.findByIdAndDelete(subTaskId)

    if (!deletedSubTasks){
        throw new ApiError(404 , "SubTask not found")
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
            200,
            {},
            "Sub Task deleted successfully"
        )
      )
})

export {
    createTask,
    getTask,
    deleteTask,
    getTaskbyId,
    updateTask,
    createSubTask,
    updateSubTask,
    deleteSubTask
}