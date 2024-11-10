<script lang="ts">
	import {
		evaluateEnvironment,
		evaluateLanguage,
		evaluatePath,
		evaluateTicketNumber,
		groupAndSortLinks,
		linkCreator,
		type GroupedLinks
	} from '@cm-url-magic/utility';

	import { Environments, type Link, type userInfoType } from '@cm-url-magic/utility';
	import './tailwind.css';
	import { onMount } from 'svelte';
	import '@picocss/pico';
	import UserInputField from './UserInputField.svelte';
	import LinkWithCopyButton from './LinkWithCopyButton.svelte';
	import Footer from './Footer.svelte';
	import { interestingLinks } from './interestingLinks';

	let isActive: boolean = false;
	let activeTabUrl: string | undefined = '';
	let links: Link[] = [];
	let groupedData: GroupedLinks = {};
	let userInfo: userInfoType = {};
	let optionalInputUrlParam: string = '';
	let groupedInterestingLinks: GroupedLinks = groupAndSortLinks(interestingLinks);

	// Listen for URL updates from the background script
	if (typeof chrome !== 'undefined' && chrome.tabs) {
		chrome.runtime.onMessage.addListener((message) => {
			if (message.newUrl) {
				activeTabUrl = message.newUrl;
				isActiveUrlRelevant(); // Check URL relevance whenever the URL changes

				userInfo = {
					environment: undefined,
					ticketNumber: '',
					subdomain: '',
					secondLevelDomain: '',
					language: '',
					path: ''
				};

				if (activeTabUrl) {
					userInfo.environment = evaluateEnvironment(activeTabUrl);
					userInfo.ticketNumber = evaluateTicketNumber(activeTabUrl);
					userInfo.language = evaluateLanguage(activeTabUrl);
					userInfo.path = evaluatePath(activeTabUrl, userInfo.environment, userInfo.language);
				}
			}
		});
	}

	const isActiveUrlRelevant = () => {
		if (typeof chrome !== 'undefined' && chrome.tabs) {
			chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
				if (tabs.length > 0 && tabs[0].url) {
					const environment = evaluateEnvironment(tabs[0].url);

					if (environment?.name) {
						activeTabUrl = tabs[0].url;
						isActive = true; // Update isActive here inside the callback

						if (environment.name === Environments.JIRA) {
							userInfo.environment = evaluateEnvironment(activeTabUrl);
							userInfo.ticketNumber = evaluateTicketNumber(activeTabUrl);
						} else {
							// Re-evaluate and update userInfo and links for the new valid URL
							userInfo.environment = evaluateEnvironment(activeTabUrl);
							userInfo.ticketNumber = evaluateTicketNumber(activeTabUrl);
							userInfo.language = evaluateLanguage(activeTabUrl);
							userInfo.path = evaluatePath(activeTabUrl, userInfo.environment, userInfo.language);
						}

						links = linkCreator(userInfo); // Update links for the new URL
						groupedData = groupAndSortLinks(links);
					} else {
						// Invalid URL: Reset the state
						isActive = false;
						links = []; // Clear the links if the URL is invalid
						activeTabUrl = ''; // Clear the active URL
					}
				} else {
					// No active tab or URL found, reset state
					isActive = false;
					links = [];
					activeTabUrl = '';
				}
			});
		} else {
			// If chrome API is not available, reset state
			isActive = false;
			links = [];
			activeTabUrl = '';
		}
	};

	// Call this function when the component mounts
	onMount(() => {
		isActiveUrlRelevant(); // Check the active tab URL on mount
	});
</script>

<svelte:head>
	<title>CM URL Magic Extension</title>
	<link rel="stylesheet" href="/build/bundle.css" />
</svelte:head>

<main>
	{#if !isActive}
		<div class="container-fluid">
			<form>
				<fieldset>
					<UserInputField
						bind:value={optionalInputUrlParam}
						on:change={() => {
							userInfo.optionalTicketNumber = evaluateTicketNumber(optionalInputUrlParam);
							links = linkCreator(userInfo); // Update links for the new URL
						}}
						label="Gimme your ticket number!"
					/>
				</fieldset>
			</form>
			<h6>Sorry! Not sure what to do with this URL... here some convenient links for you!</h6>
		</div>
		<div class="custom-grid">
			{#each Object.values(groupedInterestingLinks) as group}
				<div>
					<h5>{group.group}</h5>
					{#each group.links as link}
						<div class="link-wrapper">
							<LinkWithCopyButton {link} />
						</div>
						<hr />
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		{#if userInfo?.environment?.name !== Environments.JIRA && isActive}
			<form>
				<fieldset>
					<UserInputField
						bind:value={optionalInputUrlParam}
						on:change={() => {
							userInfo.optionalTicketNumber = evaluateTicketNumber(optionalInputUrlParam);
							links = linkCreator(userInfo); // Update links for the new URL
						}}
						label="Optional ticket number if needed..."
					/>
				</fieldset>
			</form>
		{/if}
		<div class="custom-grid">
			{#each Object.values(groupedData) as group}
				<div>
					<h5>{group.group}</h5>
					{#each group.links as link}
						<div class="link-wrapper">
							<LinkWithCopyButton {link} />
						</div>
						<hr />
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</main>

<footer>
	<Footer />
</footer>

<style>
	.custom-grid {
		display: grid;
		grid-template-columns: 50% 50%; /* Two columns, each 50% */
		grid-template-rows: auto auto; /* Two rows */
	}
	.link-wrapper {
		display: flex;
		flex-direction: col;
	}
	main {
		padding: 2em;
		padding-bottom: 0;
	}

	hr {
		margin: 0.5em;
	}
</style>
