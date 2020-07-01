import File from "./file";

export default interface Image extends File {
  width: string;
  height: string;
  alt?: string;
  title?: string;
}
