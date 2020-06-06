/**
 * @description
 *    This model holds the HR rating related fields.
 */

export interface RatingForm {
  applicantScore: ApplicantScore;
  impressionInfo: ImpressionInfo;
}

export interface ApplicantScore {
  rhetoric: number;
  motivation: number;
  selfAssurance: number;
  personalImpression: number;
}

export interface ImpressionInfo {
  impression: string;
}
