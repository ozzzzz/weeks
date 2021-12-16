class Userdata {
  private birth: Date;
  private millisBehind: number;
  private weeksBehind: number;

  constructor(birthDate: Date) {
    this.birth = birthDate;
    const now = new Date();
    this.millisBehind =
      Math.max(now.getTime() - this.birth.getTime(), 0);
    const millis_in_week = 1000 * 60 * 60 * 24 * 7;
    this.weeksBehind = Math.floor(this.millisBehind / millis_in_week);
  }

  public getBirth(): Date {
      return this.birth;
  }

  public getWeeksBehind(): number {
      return this.weeksBehind;
  }

  public getWeeksLeft(): number {
      return this.getWeeksExpect() - this.getWeeksBehind();
  }

  public getWeeksExpect(): number {
    // TODO: ideas: use country, sex
      const worldConstant: number = 72.6;
      return this.yearsToWeeks(worldConstant);
  }
  
  private yearsToWeeks(years: number): number {
    return Math.round(52.1429 * years);
  }

  public static default(): Userdata {
      return new Userdata(new Date('1990-01-01'))
  }
}

export default Userdata;
