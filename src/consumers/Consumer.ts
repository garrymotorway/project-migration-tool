export default interface Consumer {
    consume(): Promise<any>;
}