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
import { RxCaretDown } from "react-icons/rx";
import { IoIosClose } from "react-icons/io";

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
  caretDown: RxCaretDown,
  close: IoIosClose,
};

export default Icons;