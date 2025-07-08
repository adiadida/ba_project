export const PotentialJudgementEntropyDataGrid = ({prefsMultiInputs,potPrefsEntropy}:PotentialJudgementEntropyProps) => {
  return(<></>)
}


export type PotentialJudgementEntropyProps = {
  prefsMultiInputs: number[][][]; // judgMultiInputs[criterion][alternative][preference]
  potPrefsEntropy: number[][][]
}