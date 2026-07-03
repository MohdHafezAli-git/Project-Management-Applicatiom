import { Router } from "express"; 
import {  createTask,
    getTask,
    deleteTask,
    getTaskbyId,
    updateTask,
    createSubTask,
    updateSubTask,
    deleteSubTask } from "../controllers/task.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createTaskValidator, createSubTaskValidator , updateTaskValidator , updateSubTaskValidator } from "../validators/index.js";
import { verifyJWT ,vallidateProjectPermission, vallidateTaskPermission , validateSubTaskPermission } from "../middlewares/auth.middleware.js";
import { UserRoleEnum } from "../utils/constants.js";

const router = Router()

router.use(verifyJWT)

router
  .route("/:projectId")
  .get(getTask)
  .post(createTaskValidator() ,vallidateProjectPermission([UserRoleEnum.ADMIN],[UserRoleEnum.PROJECT_ADMIN]), validate , createTask)

router
  .route("/t/:taskId")
  .get(getTaskbyId)
  .put(updateTaskValidator() , vallidateTaskPermission([UserRoleEnum.ADMIN]),validate , updateTask)
  .delete(vallidateTaskPermission([UserRoleEnum.ADMIN]) , validate , deleteTask)

router
  .route("/t/:taskId/subtasks") 
  .post(createSubTaskValidator(), vallidateTaskPermission([UserRoleEnum.ADMIN]),validate , createSubTask)

router
  .route("/:taskId/subtask/:subTaskId")
  .put(updateSubTaskValidator() , validateSubTaskPermission([UserRoleEnum.ADMIN]) , validate , updateSubTask)

router
  .route("/subtasks/:subTaskId")
  .delete(validateSubTaskPermission([UserRoleEnum.ADMIN]), validate , deleteSubTask)


export default router