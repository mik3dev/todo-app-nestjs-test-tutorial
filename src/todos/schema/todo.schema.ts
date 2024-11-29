import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

@Schema({
  timestamps: true,
})
export class Todo {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: false })
  completed: boolean;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
