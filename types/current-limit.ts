export type CurrentLimit = {
  /**
   * Sequential number, starts on 1
   */
  schemaId: number,
  /**
   * 00:00:00
   */
  start: string,
  /**
   * 24:00:00
   */
  stop: string,
  /**
   * Always 8? All days of the week?
   */
  weekday: 8,
  /**
   * Amps (example 10 gives 3x10 = 30 amps on 3-phase)
   */
  chargeLimit: number,
};

