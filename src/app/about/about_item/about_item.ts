export class AboutItem {
  private displayName: string;
  private bio: string;
  private picture: string;
  private reversed: boolean = false;

  constructor(
    displayName: string,
    bio: string,
    picture: string,
    reversed: boolean = false
  ) {
    this.displayName = displayName;
    this.bio = bio;
    this.picture = picture;
    this.reversed = reversed;
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

  public isReversed(): boolean {
    return this.reversed;
  }
}
