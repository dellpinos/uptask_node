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

        // Check if the user is already in the project
        const alreadyInProject = req.project.team.some(memberId => memberId.toString() === id);

        if (alreadyInProject) {
            return res.status(409).json({ error: 'El usuario ya es parte del proyecto' });
        }

        // Find User
        const user = await User.findById( id ).select('id');

        if (!user || id === req.project.manager.toString()) {
            const error = new Error('Usuario no encontrado');
            return res.status(404).json({ error: error.message });
        }

        req.project.team.push(user.id);
        await req.project.save();

        res.json('Usuario agregado correctamente');
    }

    static removeMemberById = async (req: Request, res: Response) => {

        const { id } = req.body;

        req.project.team = req.project.team.filter( teamMember => teamMember.toString() !== id);

        await req.project.save();

        res.send('Usuario eliminado correctamente');


    }
}