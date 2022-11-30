import {Component, OnInit} from '@angular/core';
import {catchError, concatMap, count, EMPTY, filter, forkJoin, from, map, Observable, of, Subscriber, tap} from "rxjs";
import {ajax} from "rxjs/ajax";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'rx-js-demo';

  ngOnInit(): void {

  }

  observableTest(): void {
    const observable$ = new Observable<string>(subscriber => {
      console.log('Observable executed');

      subscriber.next('Alice')
      subscriber.next('Ben')
      setTimeout(()=> subscriber.error(new Error('Failure')),2000);
      setTimeout(()=> {
        subscriber.next('Charlie')
        subscriber.complete();
      },4000);

      return ()=> {
        console.log('Teardown')
      }
    });

    console.log('Before subscribe')
    observable$.subscribe({
      next: value => console.log(value),
      error: err => console.log(err.message),
      complete: () => console.log('Completed')
    });

  }

  observableTest2(): void {
    const interval$ = new Observable<number>(subscriber => {
      let counter = 1;
      const intervalId = setInterval(()=> {
        console.log('Emitted-', counter);
        subscriber.next(counter++);
      },2000);

      return ()=> {
        clearInterval(intervalId);
      }
    });

    const subscription = interval$.subscribe(value=> console.log(value));

    setTimeout(()=> {
      console.log('Unsubscribed')
      subscription.unsubscribe();
    }, 7000)

  }

  callAjax(): void {
    const ajax$ = ajax<any>('https://random-data-api.com/api/name/random_name');

    ajax$.subscribe(itm=> {
      console.log('Sub 1: '+itm.response.first_name);
    });

    ajax$.subscribe(itm=> {
      console.log('Sub 2: '+itm.response.first_name);
    });

    ajax$.subscribe(itm=> {
      console.log('Sub 3: '+itm.response.first_name);
    });
  }

  ofFunctionTest(): void {
    of('Mahadi', 'Hasan', 'Shimul').subscribe(itm=> console.log(itm));
  }

  fromFunctionTest(): void {
    from(['Alice','Ben','Charlie']).subscribe({
      next: value => console.log(value),
      complete: () => console.log('Completed')
    });
  }

  forkJoinTest(): void {
    const randomUser$ = ajax<any>('https://random-data-api.com/api/v2/users');
    const randomBank$ = ajax<any>('https://random-data-api.com/api/v2/banks');
    const randomAppliance$ = ajax<any>('https://random-data-api.com/api/v2/appliances');


    forkJoin([randomUser$, randomBank$, randomAppliance$])
    .subscribe(([userRes, bankRes, applianceRes]) => {
      console.log(`User: ${userRes.response.first_name}`);
      console.log(`Bank: ${bankRes.response.bank_name}`);
      console.log(`Brand: ${applianceRes.response.brand}`)
    });

    console.log('-------------------');
  }

  filterTest(): void {
    const newsFeed$ = new Observable<NewsItem>(subscriber=> {
      subscriber.next({category: 'Business', content: 'A'})
      subscriber.next({category: 'Sports', content: 'B'});
      subscriber.next({category: 'Business', content: 'C'});
      subscriber.next({category: 'Sports', content: 'D'});
      subscriber.next({category: 'Business', content: 'E'});
    });

    console.log('-----All news feed-----');
    newsFeed$.subscribe(itm=> {
      console.log(itm);
    });

    const sportsNewsFeed$ = newsFeed$.pipe(
      filter(item => item.category === 'Sports')
    );

    console.log('----Sprots New Feed----');
    sportsNewsFeed$.subscribe(itm=> console.log(itm));

  }

  mapTest(): void {
    const randomUser$ = ajax<any>('https://random-data-api.com/api/v2/users').pipe(
      map(res => res.response.first_name)
    );
    const randomBank$ = ajax<any>('https://random-data-api.com/api/v2/banks').pipe(
      map(res=> res.response.bank_name)
    )
    const randomAppliance$ = ajax<any>('https://random-data-api.com/api/v2/appliances').pipe(
      map(res => res.response.brand)
    );

    randomUser$.subscribe(itm=> console.log(itm));
    randomBank$.subscribe(itm=> console.log(itm));
    randomAppliance$.subscribe(itm=> console.log(itm));
  }

  tapTest(): void {
    of(1, 7, 3, 6,2).pipe(
      tap(itm=> console.log('Spy: '+itm)),
      map(itm=> itm * 2),
      tap(itm=> console.log('Spy: '+itm)),
      filter(itm => itm > 5)
    ).subscribe(itm=>console.log('value: '+itm));
  }

  debounceTimeTest(): void {

  }

  catchErrorTest(): void {
    const faillingHttpRequest$ = new Observable(subscriber => {
      setTimeout(()=> {
        subscriber.error(new Error('Timeout'));
      },3000)
    });

    console.log('App started');

    faillingHttpRequest$.pipe(
      // catchError(error => of('Fallback value'))
      catchError(error => EMPTY)
    ).subscribe(value => {
      console.log(value)
    })
  }

  flatteningOperatorConcatMapTest(): void {

    const source$ = new Observable(subscriber => {
      setTimeout(()=> subscriber.next('A'), 2000);
      setTimeout(()=> subscriber.next('B'), 5000);
    });

    console.log('App has started');

    source$.pipe(
        concatMap(value => of(1,2))
    ).subscribe(value => console.log(value));


  }

  onTest(value: any) {
    console.log(value.value);
  }
}

interface NewsItem{
    category: 'Business' | 'Sports';
    content: string;
}
