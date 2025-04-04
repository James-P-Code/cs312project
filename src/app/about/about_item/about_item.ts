export class AboutItem {
    private displayName: string;
    private bio: string;
    private picture: string;

    constructor(displayName: string, bio: string,picture: string) {
        this.displayName = displayName;
        this.bio = bio;
        this.picture = picture;
    }

    public getDisplayName(): string {
        return this.displayName;
    }

  public getBio(): string {
        return this.bio;
    }
    public getPicture(): string {
        return this.picture;
    }   

    
}
