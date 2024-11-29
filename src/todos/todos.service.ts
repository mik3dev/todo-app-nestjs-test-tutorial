import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from './schema/todo.schema';
import { Model } from 'mongoose';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private readonly model: Model<TodoDocument>,
  ) {}

  async create(createTodoDto: CreateTodoDto) {
    const { title, description, completed } = createTodoDto;
    if (!title) throw new NotFoundException('Title is required');
    return await this.model.create({
      title,
      description,
      completed,
    });
  }

  async findAll() {
    return await this.model.find();
  }

  async findOne(id: string) {
    const todo = await this.model.findById(id);
    if (!todo) throw new NotFoundException(`Todo with id ${id} not found`);
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto) {
    const todo = await this.model.findByIdAndUpdate(id, updateTodoDto, {
      new: true,
    });
    if (!todo) throw new NotFoundException(`Todo with id ${id} not found`);
    return todo;
  }

  async remove(id: string) {
    const todo = await this.model.findByIdAndDelete(id);
    if (!todo) throw new NotFoundException(`Todo with id ${id} not found`);
    return todo;
  }
}
