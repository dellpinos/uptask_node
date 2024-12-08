import type { Response, Request } from "express";
import Task from "../models/Task";


export class TaskController {

    static createTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body);
            task.project = req.project.id;
            req.project.tasks.push(task.id);
            await Promise.allSettled([task.save(), req.project.save()]);
            res.send('Tarea creada correctamente')

        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'});
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            
            const tasks = await Task.find({project: req.project.id}).populate('project');

            res.json(tasks);
        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'});
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const task = await Task.findById(id);

            console.log(task);

            res.send(task)



        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'});
        }
    }
}