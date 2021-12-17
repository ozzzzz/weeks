class Userdata {
  private birth: Date;
  private millisBehind: number;
  private weeksBehind: number;

  private readonly MILLISECONDS_IN_WEEK = 1000 * 60 * 60 * 24 * 7;
  private readonly HUNDRED_YEARS = 100;


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

  public isBelowExpectThreshold(): boolean {
    return this.getWeeksBehind() < this.getWeeksExpect();
  }

  public getWeeksLeft(): number {
      return this.getWeeksExpect() - this.getWeeksBehind();
  }

  public getWeeksExpect(): number {
    // TODO: ideas: use country, sex
      const worldConstant: number = 72.6;
      return this.yearsToWeeks(worldConstant);
  }

  /**
   * Recalculates behind and left weeks in percents. If weeks behind is more then expect, then 100 and 0 is returned.
   * @returns pair on numbers from 0 to 1
   */
  public getBehindAndLeftPercents(): Array<number> {
    if (this.isBelowExpectThreshold()) {
        const behindPercents = Math.floor(100 * this.getWeeksBehind() / this.getWeeksExpect());
        return [behindPercents, 100 - behindPercents];
    } else {
        return [100, 0];
    }
  }
  
  private yearsToWeeks(years: number): number {
    return Math.round(52.1429 * years);
  }

  public static default(): Userdata {
      return new Userdata(new Date('1990-01-01'))
  }
}

export default Userdata;
