import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';

describe('TodosController', () => {
  let controller: TodosController;
  let service: TodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        {
          provide: TodosService,
          useValue: {
            create: jest.fn().mockResolvedValue('new_todo'),
            findAll: jest.fn().mockResolvedValue(['todo1', 'todo2']),
            findOne: jest.fn().mockResolvedValue('todo'),
            update: jest.fn().mockResolvedValue('updated_todo'),
            remove: jest.fn().mockResolvedValue('deleted_todo'),
          },
        },
      ],
    }).compile();

    controller = module.get<TodosController>(TodosController);
    service = module.get<TodosService>(TodosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should return create a todo', async () => {
      const createTodoDto: any = {
        title: 'test',
        description: 'test',
        completed: false,
      };
      const result = await controller.create(createTodoDto);
      expect(service.create).toHaveBeenCalledWith(createTodoDto);
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all todos', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a todo', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateTodoDto: any = {
        title: 'test',
        description: 'test',
        completed: false,
      };
      const result = await controller.update('1', updateTodoDto);
      expect(service.update).toHaveBeenCalledWith('1', updateTodoDto);
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a todo', async () => {
      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toBeDefined();
    });
  });
});
