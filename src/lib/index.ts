function collections (db) {
    
    return (collection, FIELD)=> {
        return collection.map(id => {

            const l = Object.values(db[FIELD])
            .filter((item:any)=> item.id === id);
            return l.length ? l[0]: false;
    
          }).filter(found => found)  
    }
        
}

export const OffsetData = (list, limit, skip): any[] => {
    
    return limit > 0 ? list.splice(skip, limit): list;
}

export const ApiResponseParser = {
     getCurrentKnowledgeBase(data): any {
        if (data) {
          let objects: any = Object.values(data.KnowledgeBase);
        //   console.log("Objects", objects);
        //   let ids = objects.map((s) => {
        //     return { id: s.id };
        //   });
        //   let result = ids.map((value) => {
        //     if (data.KnowledgeBaseTranslation[value.id]) {
        //       return {
        //         ...data.KnowledgeBaseTranslation[value.id],
        //       };
        //     }
        //   });
          return objects.map((item)=> {
              return {
                  ...item,
                  translations: collections(data)(item.translation_ids, "KnowledgeBaseTranslation"),
                  kb_locales: collections(data)(item.kb_locale_ids, "KnowledgeBaseLocale")
              }
          });
        }
      }
    ,
    getCategories(data): any[] {
      if (data) {
        const categories: any = Object.values(data.KnowledgeBaseCategory);
        const categoryTranslations = Object.values(data.KnowledgeBaseCategoryTranslation);

        const withDataCategories = categories.map((category)=> {
            const translation = categoryTranslations.filter((t:any) => category.id === t.category_id);
          
           let applicableTranslation = null;
            if(translation.length) {
              applicableTranslation = translation[0];
            }
          return {
              ...category,
              title: applicableTranslation?applicableTranslation.title: "",
              translations: collections(data)(category.translation_ids, "KnowledgeBaseCategoryTranslation"),
          };
        });

        return withDataCategories;
      }

      return [];
    },
    getParentCategoriesList(data): any[] {
        if (data) {
          const categories: any = Object.values(data.KnowledgeBaseCategory);
          const categoryTranslations = Object.values(data.KnowledgeBaseCategoryTranslation);


          const baseCategories = categories.filter((category)=> !category.parent_id);

          const withDataCategories = baseCategories.map((category)=> {
              const translation = categoryTranslations.filter((t:any) => category.id === t.category_id);
            
             let applicableTranslation = null;
              if(translation.length) {
                applicableTranslation = translation[0];
              }
            return {
                ...category,
                title: applicableTranslation?applicableTranslation.title: "",
                translations: collections(data)(category.translation_ids, "KnowledgeBaseCategoryTranslation"),
            };
          });

          return withDataCategories;
        }

        return [];
    }
    ,
    getChildCategories(data, id: Number): any[] {
        if (data) {
            const categories: any = Object.values(data.KnowledgeBaseCategory);
            const categoryTranslations = Object.values(data.KnowledgeBaseCategoryTranslation);
  
  
            const baseCategories = categories.filter((category)=> category.parent_id === id);
  
            const withDataCategories = baseCategories.map((category)=> {
                const translation = categoryTranslations.filter((t:any) => category.id === t.category_id);
              
               let applicableTranslation = null;
                if(translation.length) {
                  applicableTranslation = translation[0];
                }
              return {
                  ...category,
                  title: applicableTranslation?applicableTranslation.title: "",
                  translations: collections(data)(category.translation_ids, "KnowledgeBaseCategoryTranslation"),
              };
            });
  
            return withDataCategories;
          }
  
          return [];
      }
    ,
      async readCategory(data, id): Promise<any> {
        if (data && id) {
          let objects: any = Object.values(data.KnowledgeBaseCategory);
          let ids = objects
            .filter((s) => s.id == id)
            .map((s) => {
              return { id: s.id, category_icon: s.category_icon };
            });
          let result = ids.map((value) => {
            if (data.KnowledgeBaseCategoryTranslation[value.id]) {
              return {
                ...data.KnowledgeBaseCategoryTranslation[value.id],
                category_icon: value.category_icon,
              };
            }
          });
          return result;
        }
      }
    ,
    getAnswers(data): any[] {
        if (data) {
          const answers: any = Object.values(data.KnowledgeBaseAnswer);
          const answerTranslations = Object.values(data.KnowledgeBaseAnswerTranslation);


          const answersWithTranslation = answers.map(answer => {

              const translation:any = answerTranslations.filter((t:any) => t.answer_id === answer.id)
            
              return {
                  ...answer,
                  title: translation.length ? translation[0].title : "",
                  translations: collections(data)(answer.translation_ids, "KnowledgeBaseAnswerTranslation"),
              }
          })
          
          return answersWithTranslation;
        }
      }
    ,
      async readAnswer(data, id): Promise<any> {
        if (data && id) {
          let objects: any = Object.values(
            data.KnowledgeBaseAnswerTranslationContent
          );
          let ids = objects
            .filter((s) => s.id == id)
            .map((s) => {
              return { id: s.id, body: s.body };
            });
          let answers = ids.map((value) => {
            if (data.KnowledgeBaseAnswerTranslation[value.id]) {
              return {
                ...data.KnowledgeBaseAnswerTranslation[value.id],
                body: value.body,
              };
            }
          });
          let withUser = answers.map((value) => {
            if (data.User[value.created_by_id]) {
              return {
                ...value,
                user: data.User[value.created_by_id],
              };
            }
          });
          let result = withUser.map((value) => {
            if (data.KnowledgeBaseAnswer[value.answer_id]) {
              return {
                ...value,
                attachments: data.KnowledgeBaseAnswer[value.answer_id],
              };
            }
          });
          return result;
        }
      },
      getKnowledgeBaseTranslations(data) {
          return Object.values(data.KnowledgeBaseTranslation)
      }

}