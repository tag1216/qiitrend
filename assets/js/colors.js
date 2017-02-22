
import * as colors from 'material-ui/styles/colors';


export const COLORS = (i) => {
  return COLORS.values[i % COLORS.values.length];
}
COLORS.values = [
  colors.red400,
  colors.indigo400,
  colors.teal400,
  colors.amber400,
  colors.brown400,
  colors.purple400,
  colors.lightBlue400,
  colors.lightGreen400,
  colors.orange400,
  colors.blueGrey400,
];
