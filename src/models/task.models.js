import mongoose , {Schema} from "mongoose";
import {AvailableTaskStatus , TaskStatusEnum} from "../utils/constants.js"

const taskSchema = new Schema({
    title : {
        type : String,
        required : true,
        trim : true
    },

    description : String ,

    project : {
        type : Schema.Types.ObjectId,
        ref : "Project",
        required : true
    },

    assignedTo : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },

    assignedBy : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },

    status : {
        type : String,
        enum : AvailableTaskStatus,
        default : TaskStatusEnum.TODO
    },

    attachments : {
        type : [{
            url : String,
            mimeType : String, // may be pdf but we keep it as a string
            size : Number 
        }],
        default : []
    }
},{timestamps:true})

export const task = mongoose.model("Task" , taskSchema)