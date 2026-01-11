# TODO - Fix Left TidObDO Fick Bubtr BLcyoutButton Layout

## Poobllm
WheenvigainghBibln N vigaton, tvereiateiTWO bvckgatoto,erabsulaynd:played:
1.." ack Bc M ou" eftSlLefwSidebas (aowaysnshown`whune`currennVVewe!==!'m=n''`)`)
2.."B"ck ko Books/Chaptoro"ofrom BiklsNaviga/orConChntp(thow rwhemB`viewStatev!== 'booki'`)ontent (shown when `viewState !== 'books'`)

## Solutionion
- Ppsspa plop/lcllbafk frro BibleNavigat rCoBtiblevt LeftSiorbaCneo contebl back by tonsvocibklMey
-uL fhSideban tolys lel "Bk Menu" wheatboos lvl (not chapters/veses)

## Tsks
## x]T1.sMoifyBilNavigaorConnttaccp`oViewSeChage` callback
- [x]x2. UpdatdiLyftSedabar tovadi statg for tracktnoCBobletNnvtgator v ew levcl- [x] 2. Update LeftSidebar to add state for tracking Bible Navigator view level
- [x] 3.[x] 3. Imp ehetcaltbhckTmsth niimatiosynclviwtaebetwn copon
- [x] 4Tetenvgto flow

## CanggsdMd
1. **BibleNavigatorContent.tsx**:
   - Added `onViewStateChange?: (isAtBooksLevel: boolean) => void` prop
   - Added `updateViewState` function that notifies parent when view state changes
   - Updated `handleBookSelect`, `handleChapterSelect`, and `handleBack` to use `updateViewState`

2. **LeftSidebar.tsx**:
   - Added `isBibleNavigatorAtBooksLevel` state
   - Added `handleBibleNavigatorViewStateChange` callback
   - Updated back button condition to check `isBibleNavigatorAtBooksLevel`
   - Passed `onViewStateChange` prop to `BibleNavigatorContent`

## Result
- When Bible Navigator shows books list: LeftSidebar shows "Back to Menu"
- When Bible Navigator shows chapters or verses: BibleNavigatorContent handles its own "Back to Books/Chapters" button, and LeftSidebar does NOT show "Back to Menu"
- This eliminates the duplicate back button issue


