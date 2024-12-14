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
            const { taskId } = req.params;
            const task = await Task.findById(taskId);

            if(!task) {
                const error = new Error('Tarea no encontrada');
                return res.status(404).json({error: error.message});
            }

            if( task.project.toString() !== req.project.id) {
                const error = new Error('Algo salió mal');
                return res.status(400).json({error: error.message});
            }

            res.json(task);

        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'});
        }
    }

    static updateTask = async (req: Request, res: Response) => {
        try {
            const { taskId} = req.params;
            const task = await Task.findByIdAndUpdate(taskId, req.body);

            if(!task) {
                const error = new Error('Tarea no encontrada');
                return res.status(404).json({error: error.message});
            }

            if(task.project.toString() !== req.project.id) {
                const error = new Error('Algo salión mal');
                return res.status(400).json({error: error.message});
            }
            res.send('Tarea Actualizada Correctamente');


        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }


    static deleteTask = async (req: Request, res: Response) => {
        try {
            const { taskId} = req.params;
            const task = await Task.findById(taskId);

            if(!task) {
                const error = new Error('Tarea no encontrada');
                return res.status(404).json({error: error.message});
            }
            req.project.tasks = req.project.tasks.filter( item => item !== task);

            await Promise.allSettled([task.deleteOne(), req.project.save()]);

            res.send('Tarea Eliminada Correctamente');

        } catch (error) {
            console.log(error);
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}