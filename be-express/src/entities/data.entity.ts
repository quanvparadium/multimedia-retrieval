import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { User } from './user.entity';
import { KeyFrame } from './keyframe.entity';

export enum DataType {
    Video = 'video',
    Image = 'image'
    // Document = 'document'
}

@Entity()
export class Data {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'bigint' })
    size: number;

    @Column({
        type: 'enum',
        enum: DataType
    })
    type: DataType;

    @Column({ length: 50 })
    fileName: string;

    @Column({ length: 20 })
    status: string;

    @ManyToOne(() => User, (user) => user.data)
    user: User;

    @Column({ default: 'local' })
    store: string;

    @Column()
    address: string;

    @OneToMany(() => KeyFrame, (keyFrame) => keyFrame.data)
    keyFrames: KeyFrame[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
