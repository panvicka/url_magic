<script lang="ts">
  import UserInputField from "../lib/components/UserInputField.svelte";

  import Footer from "../lib/components/Footer.svelte";
  import Header from "../lib/components/Header.svelte";
  import { queryParam } from "sveltekit-search-params";
  import { onMount } from "svelte";
  import type {
    Link,
    userInfoType,
    GroupedLinks,
  } from "@cm-url-magic/utility/dist/types";
  import {
    evaluateEnvironment,
    evaluateLanguage,
    evaluatePath,
    evaluateTicketNumber,
    linkCreator,
    linkCreatorV2,
    isLinkWorking,
  } from "@cm-url-magic/utility";
  import CopyToClipButton from "$lib/components/CopyToClipButton.svelte";

  const mainInputUrlParam = queryParam("mainInput");
  const optionalInputUrlParam = queryParam("secondaryInput");

  let links: Link[] = [];
  let groupedData: GroupedLinks = {};

  let userInfo: userInfoType = {};

  $: mainUserInput = $mainInputUrlParam;
  $: optionalUserInput = $optionalInputUrlParam;

  $: {
    mainUserInput = $mainInputUrlParam;
    evaluateInput();
  }
  $: {
    optionalUserInput = $optionalInputUrlParam;
    evaluateInput();
  }

  onMount(() => {
    if (mainInputUrlParam) {
      mainUserInput = $mainInputUrlParam || "";
    } else {
      mainUserInput = "";
    }
    if (optionalInputUrlParam) {
      optionalUserInput = $optionalInputUrlParam || "";
    } else {
      optionalUserInput = "";
    }
    if ($mainInputUrlParam || $optionalInputUrlParam) {
      evaluateInput();
    }
  });

  const evaluateOptionalTicketIdentification = (userInputValue: string) => {
    userInfo.optionalTicketNumber = evaluateTicketNumber(userInputValue);
  };

  function evaluateInput() {
    mainUserInput = mainUserInput?.trim() || "";
    optionalUserInput = optionalUserInput?.trim() || "";

    if (mainUserInput) {
      $mainInputUrlParam = mainUserInput;
    }
    if (optionalUserInput) {
      $optionalInputUrlParam = optionalUserInput;
    }

    userInfo = {
      environment: undefined,
      ticketNumber: "",
      subdomain: "",
      secondLevelDomain: "",
      language: "",
      path: "",
    };

    userInfo.environment = evaluateEnvironment(mainUserInput);
    userInfo.ticketNumber = evaluateTicketNumber(mainUserInput);
    userInfo.language = evaluateLanguage(mainUserInput);
    userInfo.path = evaluatePath(
      mainUserInput,
      userInfo.environment,
      userInfo.language,
    );
    userInfo.optionalTicketNumber = evaluateTicketNumber(optionalUserInput);
    console.log(userInfo);
    links = linkCreatorV2(userInfo);
    console.log(links);

    groupedData = links.reduce((acc, item) => {
      const groupName = item.group;
      if (groupName) {
        if (!acc[groupName]) {
          acc[groupName] = {
            group: groupName,
            links: [],
          };
        }
        acc[groupName].links.push({ name: item.name, href: item.href });
      }
      return acc;
    }, {} as GroupedLinks);

    groupedData = Object.keys(groupedData)
      .sort()
      .reduce((acc: GroupedLinks, key) => {
        acc[key] = groupedData[key];
        return acc;
      }, {} as GroupedLinks);
  }
</script>

<Header />
<main class="container">
  <form>
    <fieldset>
      <UserInputField
        bind:value={$mainInputUrlParam}
        on:change={({ detail }) => {
          mainUserInput = detail.value;
          evaluateInput();
        }}
        label="Paste your KSB related link or ticket number here..."
      />
    </fieldset>
    <fieldset>
      <UserInputField
        bind:value={$optionalInputUrlParam}
        on:change={({ detail }) => {
          optionalUserInput = detail.value;
          evaluateOptionalTicketIdentification(optionalUserInput);
          evaluateInput();
        }}
        label="Optional ticket number if needed..."
      />
    </fieldset>
  </form>

  <div class="grid">
    {#each Object.values(groupedData) as group}
      <div>
        <h2>{group.group}</h2>
        {#each group.links as link}
          <div class="link-wrapper">
            {#await isLinkWorking(link.href)}
              <span aria-busy="true"></span>
            {:then isWorking}
              <CopyToClipButton link={link.href} {isWorking} />
            {/await}
            <a href={link.href} target="_blank">{link.name}</a>
          </div>
          <hr />
        {/each}
      </div>
    {/each}
  </div>
</main>

<Footer />

<style>
  .container {
    padding: 2em 0;
  }

  a {
    margin-left: 1rem;
  }
  .link-wrapper {
    display: flex;
    flex-direction: row;
  }
</style>
