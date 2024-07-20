import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    ManyToOne,
    UpdateDateColumn,
    Unique,
    JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { Membership } from './member-ship.entity';

@Entity()
@Unique(['user'])
export class Subscribe {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, (user) => user.subscription)
    @JoinColumn() // Add this line
    user: User;

    @ManyToOne(() => Membership)
    membership: Membership;

    @Column()
    expiredAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
