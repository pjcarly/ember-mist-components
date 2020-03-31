import DrupalModelInterface from "./drupal-model";

export default interface File extends DrupalModelInterface {
  url: string;
  uri: string;
  hash: string;
  filesize: number;
  filename: string;
  filemime: string;
}
