(() => {
  'use strict';
  const counterId = 113784473;

  function story(caseId) {
    let started = false;
    let completed = false;
    const send = name => {
      // Analytics must never interrupt the story, including with ad blockers.
      try {
        if (typeof window.ym === 'function') {
          window.ym(counterId, 'reachGoal', name, { case_id: caseId });
        }
      } catch {}
      try {
        if (typeof window.gtag === 'function') {
          window.gtag('event', name, { case_id: caseId });
        }
      } catch {}
    };
    return {
      start() {
        if (started) return;
        started = true;
        send('story_start');
      },
      complete() {
        if (!started || completed) return;
        completed = true;
        send('story_complete');
      }
    };
  }

  window.ProjectAnalytics = { story };
})();
