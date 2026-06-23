import {
	createJsonApiClient,
	defineJsonApiSchema,
	type JsonApiCollectionDocument,
} from "@ailuracode/alpine-json-api";
import type { QueryState, QueryStore } from "@ailuracode/alpine-query";
import type { Alpine } from "alpinejs";

export const jsonApiSchema = defineJsonApiSchema({
	articles: {
		attributes: {} as { title: string; body: string },
		relationships: {
			author: { type: "people" as const },
		},
	},
	people: {
		attributes: {} as { name: string },
	},
});

type ArticlesDocument = JsonApiCollectionDocument<typeof jsonApiSchema, "articles">;
type ArticlesQuery = QueryState<ArticlesDocument> & { destroy(): void };

type JsonApiDemoRow = {
	id: string;
	title: string;
	author: string;
};

type JsonApiDemoData = {
	query: ArticlesQuery | null;
	rows: JsonApiDemoRow[];
	init(): void;
	destroy(): void;
};

export const jsonApiDemoOptions = {
	schema: jsonApiSchema,
	baseUrl: "/json-api",
	fetcher: async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = String(input).replace("/json-api/articles", "/json-api/articles.json");

		return fetch(url, init);
	},
};

export const jsonApiClient = createJsonApiClient(jsonApiDemoOptions);

export function registerJsonApiDemo(Alpine: Alpine): void {
	Alpine.data("jsonApiDemo", (): JsonApiDemoData => ({
		query: null,
		get rows(): JsonApiDemoRow[] {
			const included = this.query?.data?.included ?? [];

			return (this.query?.data?.data ?? []).map((article) => {
				const authorId = article.relationships?.author?.data?.id;
				const author = included.find(
					(resource) => resource.type === "people" && resource.id === authorId,
				);

				return {
					id: article.id,
					title: article.attributes.title,
					author: author?.attributes.name ?? "Unknown",
				};
			});
		},
		init() {
			const store = Alpine.store("query") as QueryStore;

			this.query = store.observe(["json-api", "articles"], () =>
				jsonApiClient.findAll("articles", { include: ["author"] }),
			);
		},
		destroy() {
			this.query?.destroy();
			this.query = null;
		},
	}));
}
