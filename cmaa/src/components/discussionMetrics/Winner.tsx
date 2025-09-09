import {GenericCard} from "@/components/generics/GenericCard";
import {Typography} from "@mui/material";

export const Winner = ({alternativeWinner, chanceWinner}:WinnerProps) => {
  return (
      <GenericCard title={'Sieger'} child={
          <Typography>Alternative {alternativeWinner} mit einer Chance von {chanceWinner}%</Typography>
      }/>
  )
}
export type WinnerProps = {
    alternativeWinner: number;
    chanceWinner: number;
}