import Image from "./image";
import DrupalModelInterface from "./drupal-model";

export default interface UserModelInterface extends DrupalModelInterface {
  name: string;
  status: boolean;
  firstName: string;
  lastName: string;
  mail: string;
  userPicture?: Image;
  unseenNotifications: number;
  notificationsViewed?: Date;

  setNotificationsViewed(): void;
  setAllNotificationsRead(): void;
}
