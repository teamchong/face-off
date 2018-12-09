export default (
  action$: Observable<RootActions>,
  state$: StateObservable<RootState>
) =>
  action$.pipe(
    filter(isOfType(FETCH_MP4URL)),
    switchMap(({ payload: videoUrl }) =>
      from(fetch(`${VIDEO_API}${videoUrl}`)).pipe(
        switchMap(result => result.json()),
        tap(result => console.log(result)),
        map(result => result.filter(r => /^video\/(?:mp4|webm);/.test(r.type))),
        map(result =>
          !result.length
            ? fetchedMp4Url({
                videoUrlLoaded: videoUrl,
                mp4Url: videoUrl,
              })
            : fetchedMp4Url({
                videoUrlLoaded: videoUrl,
                mp4Url: result[result.length - 1].url,
              })
        )
      )
    )
  );
