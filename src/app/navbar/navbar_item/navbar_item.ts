export class NavbarItem {
    private displayName: string;
    private url: string;

    constructor(displayName: string, url: string) {
        this.displayName = displayName;
        this.url = url;
    }

    public getDisplayName(): string {
        return this.displayName;
    }

    public getURL(): string {
        return this.url;
    }

    public isActiveURL(routerURL: string) {
        return `/${this.url}` === routerURL;
    }
}
