export const PreferenceAcceptabilityDataGrid = ({isCurrent, altWinner, preferenceAcceptability, preferenceMultiInputs}:PreferenceAcceptabilityProps) => {
  return (
      <></>
  )
}

export type PreferenceAcceptabilityProps ={
    isCurrent: boolean,
    altWinner: number;
    preferenceAcceptability: number[][]; // array at idx of altWinner
    preferenceMultiInputs: number[][];
}