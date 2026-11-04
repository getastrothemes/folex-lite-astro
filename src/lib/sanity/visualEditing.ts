/**
 * Visual editing helper.
 *
 * Text from Sanity is linked to Studio automatically (stega). For elements
 * without text (images, lists, whole sections) add a `data-sanity` attribute
 * so editors can click them in the Presentation tool:
 *
 * @example
 * <div data-sanity={Astro.locals.preview
 *   ? dataAttribute({ id: page._id, type: page._type, path: `sections[_key=="${section._key}"]` })
 *   : undefined}>
 */
import { createDataAttribute } from "@sanity/visual-editing/create-data-attribute";
import { dataset, projectId, studioUrl } from "./env";

type DataAttributeOptions = {
  /** Document id (published id, without "drafts.") */
  id: string;
  /** Document type, e.g. "page" */
  type: string;
  /** Field path, e.g. "title" or `sections[_key=="abc"].image` */
  path: string;
};

/** Returns the `data-sanity` attribute value for one field of a document */
export const dataAttribute = ({
  id,
  type,
  path,
}: DataAttributeOptions): string =>
  createDataAttribute({
    baseUrl: studioUrl,
    projectId,
    dataset,
    id: id.replace(/^drafts\./, ""),
    type,
    path,
  }).toString();
