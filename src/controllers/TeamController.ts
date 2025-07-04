import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {

        const { email } = req.body;

        // Find User
        const user = await User.findOne({ email }).select('id email name');

        // Checks if it's the same one
        if(req.user.email === email) {
            const error = new Error('Ya eres parte de este proyecto');
            return res.status(404).json({ error: error.message });
        }

        if (!user) {
            const error = new Error('Usuario no encontrado');
            return res.status(404).json({ error: error.message });
        }

        res.json(user);
    }

    static getProjectTeam = async (req: Request, res: Response) => {

        const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id email name'
        });
        res.json(project.team);
    }

    static addMemberById = async (req: Request, res: Response) => {

        const { id } = req.body;

        // Find User
        const user = await User.findById( id ).select('id');

        if (!user || id === req.project.manager.toString()) {
            const error = new Error('Usuario no encontrado');
            return res.status(404).json({ error: error.message });
        }

        // Check if the user is already in the project
        const alreadyInProject = req.project.team.some(team => team.toString() === user.id.toString());

        if (alreadyInProject) {
            return res.status(409).json({ error: 'El usuario ya es parte del proyecto' });
        }

        req.project.team.push(user.id);
        await req.project.save();

        res.json('Usuario agregado correctamente');
    }

    static removeMemberById = async (req: Request, res: Response) => {

        const { userId } = req.params;

        // Check if the user is already in the project
        const alreadyInProject = req.project.team.some(team => team.toString() === userId);

        if (!alreadyInProject) {
            return res.status(409).json({ error: 'El usuario no es parte del proyecto' });
        }

        req.project.team = req.project.team.filter( teamMember => teamMember.toString() !== userId);
        await req.project.save();

        res.send('Usuario eliminado correctamente');
    }
}