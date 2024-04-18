import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    UpdateDateColumn
} from 'typeorm';
import { User } from './user.entity';

export enum DataType {
    Video = 'video',
    Image = 'image',
    Document = 'document'
}

@Entity()
export class Data {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    size: string;

    @Column({
        type: 'enum',
        enum: DataType
    })
    type: DataType;

    @Column({ length: 20 })
    status: string;

    @ManyToOne(() => User, (user) => user.data)
    user: User;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
