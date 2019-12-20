fq = name:["Shane Acker" TO *]

"Shane Acker" TO *

Facet
name:gary
genre_str

https://semantic-ui.com/collections/form.html
http://godong9.github.io/solr-node/docs/Query.html#hlQuery__anchor
https://lucene.apache.org/solr/guide/8_2/highlighting.html#highlighting

bin\solr.cmd start -c -p 7574 -s example/cloud/node2/solr -z localhost:9983
bin\solr.cmd start -c -p 8983 -s example/cloud/node1/solr 


java -jar -Dc=films -Dauto example\exampledocs\post.jar example\films\*.csv