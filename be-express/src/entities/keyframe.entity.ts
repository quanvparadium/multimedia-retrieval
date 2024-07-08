import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Data } from './data.entity';

@Entity()
export class KeyFrame {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    width: number;

    @Column()
    height: number;

    @Column()
    embedding: string; // You can adjust the type according to your needs

    @Column({ default: 'local' })
    store: string;

    @Column()
    address: string;

    @ManyToOne(() => Data, (data) => data.keyFrames)
    data: Data;
}
