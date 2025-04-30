import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {

        const { email } = req.body;

        // Find User
        const user = await User.findOne({ email }).select('id email name');
        if (!user) {
            const error = new Error('Usuario no encontrado');
            return res.status(404).json({ error: error.message });
        }

        res.json(user);
    }

    static addMemberById = async (req: Request, res: Response) => {

        const { id } = req.body;
        const { projectId } = req.params;

        // Find Project
        const project = await Project.findById( projectId ).select('id team manager');

        // Check if the user is already in the project
        const alreadyInProject = project.team.some(memberId => memberId.toString() === id);

        if (alreadyInProject) {
            return res.status(409).json({ error: 'El usuario ya es parte del proyecto' });
        }
    
        if (!project) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }

        // Find User
        const user = await User.findById( id ).select('id');

        if (!user || id === project.manager.toString()) {
            console.log('es el mismo', id === project.manager.toString())
            console.log('no existe', !user)
            const error = new Error('Usuario no encontrado');
            return res.status(404).json({ error: error.message });
        }

        req.project.team.push(user.id);
        await req.project.save();

        res.json('Usuario agregado correctamente');
    }
}