export const JudgementAcceptabilityDataGrid = ({isCurrent, altWinner, judgementAcceptability, judgementMultiInputs}:JudgementAcceptabilityProps) => {
  return(<></>)
}

export type JudgementAcceptabilityProps ={
    isCurrent: boolean,
    altWinner: number;
    judgementAcceptability: number[][][]; // array at idx of altWinner
    judgementMultiInputs: number[][][];
}