import { Router } from "express"; 
import {  getProject,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMembersToProject,
    getProjectMembers,
    updateMemberRole,
    deleteMember } from "../controllers/project.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { createProjectValidator, addMembersToProjectValidator } from "../validators/index.js";
import { verifyJWT , vallidateProjectPermission } from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRoleEnum } from "../utils/constants.js";

const router = Router()
router.use(verifyJWT)

router
   .route("/")
   .get(getProject)
   .post(createProjectValidator() , validate , createProject)

router
   .route("/:projectId")
   .get(vallidateProjectPermission(AvailableUserRole),getProjectById)
   .put(vallidateProjectPermission([UserRoleEnum.ADMIN]) , createProjectValidator() , validate , updateProject)
   .delete(vallidateProjectPermission([UserRoleEnum.ADMIN]) , deleteProject)

router
   .route("/:projectId/members")
   .get(getProjectMembers)
   .post(vallidateProjectPermission([UserRoleEnum.ADMIN]),addMembersToProjectValidator(),validate,addMembersToProject)

router
   .route("/:projectId/members/:userId")
   .put(vallidateProjectPermission([UserRoleEnum.ADMIN]),updateMemberRole)
   .delete(vallidateProjectPermission([UserRoleEnum.ADMIN]) , deleteMember)
export default router