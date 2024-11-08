import type { Request, Response } from "express"
import Project from "../models/Project";

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {

        const project = new Project(req.body);

        try {
            await project.save();
            res.send('Proyecto creado correctamente');
        } catch (error) {
            console.log(error);
        }
        res.send('Creando Proyecto... ');

    }

    static getAllProject = async (req: Request, res: Response) => {
        res.send('Todos los proyectos');
    }

}