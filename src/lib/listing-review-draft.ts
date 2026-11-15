import type { ListingSubmission } from "@/data/listings-repository";

export type ListingReviewDraft = {
  listing: ListingSubmission;
  sellerEmail: string;
  secondaryPhones: string[];
  whatsappPhone: string;
  selectedTags: string[];
  selectedPacks: string[];
  selectedServices: string[];
};

let listingReviewDraft: ListingReviewDraft | null = null;

export function setListingReviewDraft(draft: ListingReviewDraft) {
  listingReviewDraft = draft;
}

export function getListingReviewDraft() {
  return listingReviewDraft;
}

export function clearListingReviewDraft() {
  listingReviewDraft = null;
}
