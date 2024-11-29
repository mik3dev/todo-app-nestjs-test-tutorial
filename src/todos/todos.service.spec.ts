import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { getModelToken } from '@nestjs/mongoose';
import { Todo, TodoDocument } from './schema/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Model } from 'mongoose';

describe('TodosService', () => {
  let service: TodosService;
  let model: Model<TodoDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getModelToken(Todo.name),
          useValue: {
            create: jest.fn(async (createTodoDto: CreateTodoDto) => ({
              id: '123',
              title: createTodoDto.title,
              description: createTodoDto.description,
              completed: createTodoDto.completed ?? false,
            })),
            find: jest.fn().mockResolvedValue('todo list'),
            findById: jest
              .fn()
              .mockResolvedValueOnce('todo_1')
              .mockResolvedValueOnce(null),
            findByIdAndUpdate: jest.fn().mockResolvedValue('todo_1'),
            findByIdAndDelete: jest.fn().mockResolvedValue('todo_1'),
          },
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    model = module.get<Model<TodoDocument>>(getModelToken(Todo.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return the created todo', async () => {
      const createTodoDto: any = {
        title: 'test',
        description: 'test',
        completed: false,
      };
      const result = await service.create(createTodoDto);
      expect(model.create).toHaveBeenCalledWith(createTodoDto);
      expect(result).toBeDefined();
    });

    it('should throw an error if title is not provided', async () => {
      const createTodoDto: any = {
        description: 'test',
        completed: false,
      };
      await expect(service.create(createTodoDto)).rejects.toThrow(
        'Title is required',
      );
    });
  });

  describe('findAll', () => {
    it('should return all todos', async () => {
      const result = await service.findAll();
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a todo', async () => {
      const result = await service.findOne('123');
      expect(result).toBe('todo_1');
    });

    it('should throw an error if todo is not found', async () => {
      model.findById = jest.fn().mockResolvedValueOnce(null);
      await expect(service.findOne('123')).rejects.toThrow(
        'Todo with id 123 not found',
      );
    });
  });

  describe('update', () => {
    it('should return the updated todo', async () => {
      const updateTodoDto: any = {
        title: 'test',
        description: 'test',
        completed: false,
      };
      const result = await service.update('123', updateTodoDto);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        updateTodoDto,
        { new: true },
      );
      expect(result).toBe('todo_1');
    });

    it('should throw an error if todo is not found', async () => {
      model.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(null);
      await expect(service.update('123', {})).rejects.toThrow(
        'Todo with id 123 not found',
      );
    });
  });

  describe('remove', () => {
    it('should return the removed todo', async () => {
      const result = await service.remove('123');
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(result).toBe('todo_1');
    });

    it('should throw an error if todo is not found', async () => {
      model.findByIdAndDelete = jest.fn().mockResolvedValueOnce(null);
      await expect(service.remove('123')).rejects.toThrow(
        'Todo with id 123 not found',
      );
    });
  });
});
