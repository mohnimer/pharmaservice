(() => {
  'use strict';
  // One DOM lifecycle for the current application. Feature modules subscribe
  // with their original mutation scope, so unrelated changes do not rerun them.
  const subscriptions = new Set();
  function relevant(record, target, options) {
    if(record.target !== target && !(options.subtree && target.contains(record.target))) return false;
    if(record.type === 'childList') return !!options.childList;
    if(record.type === 'characterData') return !!options.characterData;
    return !!options.attributes && (!options.attributeFilter || options.attributeFilter.includes(record.attributeName));
  }
  const observer = new MutationObserver(records => {
    for(const entry of subscriptions) {
      const matching = records.filter(record => entry.targets.some(([target, options]) => relevant(record, target, options)));
      if(matching.length) entry.callback(matching, entry.handle);
    }
  });
  observer.observe(document.body, {childList:true, subtree:true, attributes:true, characterData:true});
  window.PSC_ENHANCEMENTS = {
    createObserver(callback) {
      const entry = {callback, targets:[], handle:null};
      entry.handle = {
        observe(target, options) {
          const old = entry.targets.findIndex(([node]) => node === target);
          if(old !== -1) entry.targets.splice(old, 1);
          entry.targets.push([target, options]); subscriptions.add(entry);
        },
        disconnect() { entry.targets=[]; subscriptions.delete(entry); },
        takeRecords() { return []; }
      };
      return entry.handle;
    }
  };
})();
