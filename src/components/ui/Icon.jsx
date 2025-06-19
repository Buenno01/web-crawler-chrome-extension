import {
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiBarChartLine,
  RiFileList3Line,
  RiCodeSSlashLine,
  RiLinksLine,
  RiFileTextLine,
} from "react-icons/ri";
import { FiAlertTriangle } from "react-icons/fi";

const Icons = {
  success: RiCheckboxCircleLine,
  critical: RiErrorWarningLine,
  info: RiInformationLine,
  warning: FiAlertTriangle,
  link: RiLinksLine,
  code: RiCodeSSlashLine,
  scroll: RiFileList3Line,
  barChart: RiBarChartLine,
  file: RiFileTextLine,
};

export default Icons;