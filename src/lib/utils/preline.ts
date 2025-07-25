export const getPrelineSelectConfig = ({
  placeholder,
  searchPlaceholder,
  hasSearch = false,
}: {
  placeholder: string;
  searchPlaceholder?: string;
  hasSearch?: boolean;
}) => {
  return {
    hasSearch,
    searchPlaceholder: hasSearch ? searchPlaceholder || "Search..." : "",
    searchClasses:
      "form-input block w-full border-gray-200 focus:border-primary focus:ring-primary before:absolute before:inset-0 before:z-1",
    searchWrapperClasses:
      "bg-white p-1 sticky top-0 dropdown-search-input-wrapper",
    placeholder,
    toggleTag: `
    <button type="button" aria-expanded="false">
      <span class="order-1 text-text-default" data-title></span>
      
      <!-- Markup shown when no option is selected and the form is submitted (error state) -->
      <div class="order-2 hidden hs-success:hidden hs-error:block">
          <svg class="shrink-0 size-3.5 text-inherit" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>
      </div>
      
      <!-- Markup shown when an option is selected and the form is submitted (success state) -->
      <div class="order-2 hidden hs-success:flex items-center pointer-events-none">
        <svg class="shrink-0 size-4 text-inherit" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>

      <!-- Default dropdown indicator icon (only visible when there's no error) -->
      <div class="order-2 hs-success:hidden hs-error:hidden">
        <svg class="shrink-0 size-3.5 text-inherit " xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
      </div>
    </button>`,
    toggleClasses:
      "form-input justify-between items-center hs-select-disabled:pointer-events-none relative ps-4 pe-9 flex gap-x-2 text-nowrap w-full cursor-pointer bg-white border border-gray-200 text-start focus:shadow-none focus:outline-none focus:ring-1 focus:ring-primary",
    dropdownClasses:
      "mt-2 max-h-72 space-y-0.5 z-20 w-full bg-white border border-gray-200 overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300",
    optionClasses:
      "py-2 px-4 w-full text-text-default cursor-pointer hover:bg-slate-50 focus:outline-none focus:bg-gray-100",
    optionTemplate:
      '<div class="flex justify-between items-center w-full"><span data-title></span><span class="hidden hs-selected:block"><svg class="shrink-0 size-3.5 text-blue-600 dark:text-blue-500 dropdown-selected-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span></div>',
    extraMarkup: [],
    disabledOptionClasses: "opacity-50 cursor-not-allowed",
    selectedOptionClasses: "bg-primary text-white",
    noResultsMessage:
      '<div class="px-4 py-2 text-gray-500 text-sm">No results found</div>',
    loadingIndicatorMarkup:
      '<div class="px-4 py-2 text-sm text-gray-500">Loading...</div>',
  };
};
