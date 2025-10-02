import {GenericCard} from "@/components/generics/GenericCard";
import {Typography} from "@mui/material";

export const StrongestAlternative = ({alternativeWinner, chanceWinner}:WinnerProps) => {
  return (
      <GenericCard title={'stärkste Alternative'} child={
          <Typography>Alternative {alternativeWinner} mit einer Chance von {chanceWinner}%</Typography>
      }/>
  )
}
export type WinnerProps = {
    alternativeWinner: number;
    chanceWinner: number;
}