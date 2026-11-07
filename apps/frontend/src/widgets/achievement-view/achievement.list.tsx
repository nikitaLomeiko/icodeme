import { AchievementItem, IAchievementUI } from "@/entities/profile";
import { Button, Card } from "@/shared/ui/kit";
import { useRouter } from "next/navigation";

export interface IProps {
  achievements: IAchievementUI[];
}

export const AchievementList: React.FC<IProps> = (props) => {
  const { achievements } = props;

  const router = useRouter();

  return (
    <Card
      title="Все достижения"
      headerAction={
        <Button
          className="mt-2"
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          Назад
        </Button>
      }
    >
      <ul className="flex flex-col gap-5">
        {achievements.map((achievement) => (
          <li key={achievement.id}>
            <AchievementItem achievement={achievement} />
          </li>
        ))}
      </ul>
    </Card>
  );
};
