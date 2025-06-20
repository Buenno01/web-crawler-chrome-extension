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
import { IoHomeOutline, IoSettingsOutline } from "react-icons/io5";
import { TbDatabaseCog } from "react-icons/tb";
import { MdAutoGraph } from "react-icons/md";

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
  home: IoHomeOutline,
  settings: IoSettingsOutline,
  database: TbDatabaseCog,
  graph: MdAutoGraph,
};

export default Icons;